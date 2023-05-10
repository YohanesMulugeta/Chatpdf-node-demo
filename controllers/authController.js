const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const User = require('../model/userModel');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const Mail = require('../util/mail');

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

function filterObj(obj, ...toBeFiltered) {
  toBeFiltered.forEach((field) => {
    delete obj[field];
  });

  return { ...obj };
}

function signToken(id) {
  return jwt.sign({ id: id, iat: Date.now() / 1000 + 50 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
}

function signAndSend(user, statusCode, res, redirect) {
  const token = signToken(user._id);

  const cookieOpt = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    SameSite: 'none',
  };

  res.cookie('jwt', token, cookieOpt);

  if (redirect) return res.status(statusCode).redirect(redirect);
  user.password = undefined;
  user.emailVerified = undefined;
  user.wordsUpdatedAt = undefined;
  user.signedUpWithGoogle = undefined;
  user.createdAt = undefined;
  user.resetTokenExpiry = undefined;
  user.resetToken = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
}

// -------------------------------- SIGNUP

exports.signUp = catchAsync(async function (req, res, next) {
  if (req.user)
    return next(
      new AppError('You are already loged in. Please logout and try again.', 400)
    );

  const { name, email, password, passwordConfirm } = req.body;

  if (!name || !email || !password || !passwordConfirm)
    return next(
      new AppError('Please provide all name, email, password and passowrdConfirm')
    );

  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password: password.trim(),
    passwordConfirm: passwordConfirm.trim(),
  });

  // const emailVerificationToken = user.createEmailVerificationToken();

  // const base =
  //   process.env.NODE_ENV === 'production'
  //     ? 'https://zyno-ink.cyclic.app'
  //     : 'http://localhost:8000';

  // const url = `${base}/api/v1/users/verifyemail/${emailVerificationToken}`;

  // await user.save({ validateBeforeSave: false });

  // try {
  //   await new Mail(user, url).sendEmailVerification();
  // } catch (err) {
  //   await User.findByIdAndDelete(user._id);
  //   return next(
  //     new AppError(
  //       'Sorry something went wrong on creating a user, Please try again.',
  //       500
  //     )
  //   );
  // }

  // await new Mail(user, `${req.protocol}://${req.hostname}/`).sendWelcome();
  // signAndSend(user, 201, res);

  // setTimeout(async () => {
  //   await User.findOneAndDelete({ _id: user._id, emailVerified: false });
  // }, process.env.EMAIL_VERIFICATION * 60 * 1000);

  signAndSend(user, 200, res, '/');
  // res.status(201).json({
  //   status: 'success',
  //   message:
  //     'We have sent an email verification link to your email. Please verify your email within 30 minutes.',
  //   emailVerificationToken,
  // });
});

// ------------------------------- VERIFY EMAIL
exports.verifyEmail = catchAsync(async function (req, res, next) {
  // Recive token
  const { token } = req.params;

  // 2) ENCRYPT TOKEN
  const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 3) FINGD THE USER WITH THIS TOKEN IF NO THROW ERROR
  const user = await User.findOne({ emailVerificationToken: encryptedToken }).select(
    '+emailVerified'
  );
  if (!user) return next(new AppError('No user with this verification link.', 404));

  // delete user if there is a user with expired token
  if (user.emailVerificationExpiry.getTime() < Date.now()) {
    User.findByIdAndDelete(user._id).exec();

    return next(
      new AppError(
        'Email verification expired please sign up again and verify your email.',
        400
      )
    );
  }
  // 4) UPDATE THE USER EMAILvERIFIED FIELD TO UNDEFINED
  user.emailVerified = undefined;
  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;

  await user.save({ validateBeforeSave: false });

  signAndSend(user, 200, res);
  // 5) SEND SUCCESS MESSAGE
  // res.status(200).redirect('/');
});

async function sinUpUserWithGoogle(email, name, res) {
  const userData = {
    name,
    email,
    password: crypto.randomBytes(8).toString('hex'),
    signedUpWithGoogle: true,
  };

  userData.passwordConfirm = userData.password;

  const user = await User.create(userData);

  signAndSend(user, 201, res, '/');
}

// -------------------------------------------- GOOGLE
exports.signUpInWithGoogle = catchAsync(async function (req, res, next) {
  if (!(req.cookies.g_csrf_token && req.body.g_csrf_token))
    return next(new AppError('Failed to verify double submit cookie.', 400));

  const { credential } = req.body;

  const { email, email_verified, name, exp } = await verify(credential);

  if (!email_verified) return next(new AppError('Your email is not verified', 400));

  if (+exp * 1000 <= Date.now())
    return next(new AppError('Please login again. your google token has expired'));

  const user = await User.findOne({ email }).select('+emailVerified');

  if (!user) return sinUpUserWithGoogle(email, name, res);

  // if (user.emailVerified === false) {
  //   user.emailVerified = true;
  //   await user.save({ validateBeforeSave: false });
  // }

  signAndSend(user, 302, res, '/');
});

// ------------------------------- LOGIN

exports.logIn = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Both email and password are required.', 400));

  const user = await User.findOne({ email }).select('+password +emailVerified');

  // if (user?.emailVerified === false)
  //   return next(new AppError('Please verify your email inorder to login', 400));

  const isPasswordCorrect = await user?.isCorrect(password);
  if (!isPasswordCorrect) return next(new AppError('Invalid email or password', 400));

  signAndSend(user, 200, res);
});

// ------------------------- FROTGOT PASSWORD
exports.forgotPassword = catchAsync(async function (req, res, next) {
  const { email } = req.body;

  if (!email) return next(new AppError('Email is required', 400));

  const user = await User.findOne({ email });

  if (!user)
    return next(
      new AppError(`There is no user with ${email} address. Please sign up.`, 404)
    );

  const token = await user.createForgotToken();

  await user.save({ validateBeforeSave: false });

  const base =
    process.env.NODE_ENV === 'production'
      ? 'https://zyno-ink.cyclic.app'
      : 'http://localhost:8000';

  const url = `${base}/resetpassword/${token}`;

  await new Mail(user, url).sendResetPasswordLInk();

  res.status(200).json({
    status: 'success',
    message: `Password Reset link is sent to your email address: ${user.email}`,
  });
});

// ----------------------------- RESET PASSWORD
exports.resetPassword = catchAsync(async function (req, res, next) {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const encrypted = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetToken: encrypted }).select('+resetTokenExpiry');

  if (!user) return next(new AppError('There is no user with this reset link.', 400));

  if (Date.now() > user.resetTokenExpiry)
    return next(
      new AppError(
        'Your reset link is expired. Please request another link and try again.',
        400
      )
    );

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide both password and passwordConfirm fields', 400)
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  const updatedUser = await user.save();

  signAndSend(updatedUser, 200, res);
});

// ------------------------ isLogedIn

exports.isLogedin = catchAsync(async function (req, res, next) {
  try {
    const { authorization } = req.headers;

    const token =
      (authorization?.startsWith('Bearer') && authorization.split(' ')[1]) ||
      req.cookies.jwt;

    if (!token) return next();

    const { id, iat } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(id).select('+password');

    if (!user || user.isPassChangedAfter(iat)) return next();

    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    return next();
  }
});

// ------------------------------- GIVEFREE TRIAL
// exports.checkForFreeTrail = catchAsync(async function (req, res, next) {
//   if (req.user) return next();

//   const { freetrial } = req.headers;
//   const hasFreeTrial = req.cookies[freetrial];

//   if (!hasFreeTrial) {
//     const cookieOpt = {
//       expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       httpOnly: true,
//       SameSite: 'none',
//     };

//     res.cookie(freetrial, 'used', cookieOpt);

//     return next();
//   }

//   next(
//     new AppError(
//       'You have already used your free trial. Please register or login to get access to this feature.',
//       400
//     )
//   );
// });

// ---------------- LOGOUT
exports.logout = function (req, res, next) {
  const cookieOpt = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('jwt', '', cookieOpt);

  res.status(200).json({ status: 'success', message: 'Logout successful.' });
};

// ------------------------ PROTECT
exports.protect = catchAsync(async function (req, res, next) {
  const { authorization } = req.headers;
  const token =
    (authorization?.startsWith('Bearer') && authorization.split(' ')[1]) ||
    req.cookies.jwt;

  if (!token)
    return next(
      new AppError('You are not loged in. Please login or register and try again.', 401)
    );

  const { id, iat } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(id).select('+password');

  if (!user)
    return next(
      new AppError('There is no user with this token. Pleaase login and try again.', 400)
    );

  if (user.isPassChangedAfter(iat))
    return next(
      new AppError(
        'You have changed password recently. Please login again to get access.',
        401
      )
    );

  req.user = user;

  next();
});

// ------------------------------- STRICT TO

exports.strictTo = function (...role) {
  return catchAsync(async function (req, res, next) {
    const { user } = req;

    if (!role.includes(user.role))
      return next(new AppError('You are not allowed for this action.', 401));

    next();
  });
};

// -------------------------------------- UPDATE PASSWORD

exports.updatePassword = catchAsync(async function (req, res, next) {
  const { currentPassword, password, passwordConfirm } = req.body;
  const { user } = req;
  if (!currentPassword || !password || !passwordConfirm)
    return next(
      new AppError(
        'All fields are required. please provide currentPassword, password, and passwordConfirm.',
        400
      )
    );

  if (!(await user.isCorrect(currentPassword)))
    return next(
      new AppError(
        'The password you entered is incorrect. Please provide the correct current password.',
        400
      )
    );

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  signAndSend(user, 201, res);
});

// --------------------------------- GET ME

exports.getMe = catchAsync(async function (req, res, next) {
  const { user } = req;

  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// ------------------------------- UPDATE ME

exports.updateMe = catchAsync(async function (req, res, next) {
  const { user } = req;
  const data = req.body;

  if (data.password || data.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password update. Please use /updatePassword route.',
        400
      )
    );

  const filteredData = filterObj(
    data,
    'role',
    'subscription',
    'plan',
    'passwordChangedAt',
    'resetToken',
    'resetTokenExpiry',
    'signedUpWithGoogle',
    'wordsUpdatedAt',
    'wordsLeft',
    'userName'
  );

  Object.keys(filteredData).forEach((key) => {
    user[key] = filteredData[key];
  });

  const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

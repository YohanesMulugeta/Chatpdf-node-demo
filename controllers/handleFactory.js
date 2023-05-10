const AppError = require('../util/AppError');

exports.getAll = (Model) =>
  async function (req, res, next) {
    const docs = await Model.find();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { documnets: docs },
    });
  };

function throwError(param) {
  return new AppError(`There is no document with this ${param}. Please try again.`);
}

exports.getOne = (Model, param = 'id') =>
  async function (req, res, next) {
    const value = req.params[param];

    const doc = await (param === 'id'
      ? Model.findById(value)
      : Model.findOne({ [param]: value }));

    // Trowing error
    if (!doc) return next(throwError(param));

    res.status(200).json({ status: 'success', data: doc });
  };

exports.getByIdAndUpdate = (Model, param = 'id') =>
  async function (req, res, next) {
    const value = req.params[param];

    const options = {
      runValidators: true,
      new: true,
    };

    const updatedDoc = await (param === 'id'
      ? Model.findByIdAndUpdate(value, req.body, options)
      : Model.findOneAndUpdate({ [param]: value }, req.body, options));

    if (!updatedDoc) return next(new AppError('No document with the provided Id.', 404));

    res.status(200).json({ status: 'success', data: { updatedDoc } });
  };

exports.getByIdAndDelete = (Model, param = 'id') =>
  async function (req, res, next) {
    const value = req.params[param];

    await (param === 'id'
      ? Model.findByIdAndDelete(value)
      : Model.findOneAndDelete({ [param]: value }));

    res.status(204).json({ status: 'success', message: 'Documnet deleted successfully' });
  };

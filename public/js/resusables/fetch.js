//this function is responsible for API request with openAI backend-with endpoint of completions
async function makeRequest({ dataTobeSent = undefined, method = 'get', url }) {
  try {
    console.log(dataTobeSent);
    const { data } = await axios({
      method,
      url,
      data: dataTobeSent,
    });

    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export default makeRequest;

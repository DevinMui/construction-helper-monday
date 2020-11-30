// adapted from: https://gist.github.com/yuhgto/edb5d96e088599c2a6ea44860df9117b
// set auth token and query
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();
// var API_KEY =
//   "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjkyMTE0ODcyLCJ1aWQiOjE0ODgwMzE5LCJpYWQiOiIyMDIwLTExLTI3VDIwOjI4OjM2LjAwMFoiLCJwZXIiOiJtZTp3cml0ZSJ9.Ah-Kos4wR6L3-KCvmd4Y6ZIL3AuPfhqrgcWnuG3b3eg";
// const token = API_KEY;

const upload = async (file, itemId, columnId, token) => {
  const filename = file.name;
  const formData = new FormData();
  formData.append("variables[file]", file, filename);

  var query =
    `mutation ($file: File!) { add_file_to_column (file: $file, item_id: ${itemId}, column_id: "${columnId}") { id } }`;

  const noVariableQuery = query;
  formData.append("query", noVariableQuery);

  try {
    let d = await fetch("https://api.monday.com/v2/", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: token,
      },
    });
    d = await d.json();
    return d;
  } catch (e) {
    monday.execute("notice", {
      message: "There was an error uploading your file. Please try again.",
      type: "error",
      timeout: 10000,
    });
  }
};

// set URL and boundary
// var url = "https://api.monday.com/v2/file";
// var boundary = "xxxxxxxxxx";

export default upload;

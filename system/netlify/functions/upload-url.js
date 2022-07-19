const { S3 } = require("@aws-sdk/client-s3");

const s3Client = new S3({
  endpoint: "https://" + process.env.endpoint,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
});

export async function handler(event, context) {
  console.log(s3Client);
};

/*
const AWS = require("aws-sdk");
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } =
  process.env;

const s3 = new AWS.S3({
  signatureVersion: "v4",
  credentials: new AWS.Credentials(
    MY_AWS_ACCESS_KEY_ID,
    MY_AWS_SECRET_ACCESS_KEY
  ),
});

module.exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const { fileName, fileType } = body;

  if (!fileName && !fileType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing fileName or fileType on body",
      }),
    };
  }

  const s3Params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    ACL: "public-read"
    // Metadata: {
    //   foo: 'bar',
    //   lol: 'hi'
    // }
  };

  const uploadURL = s3.getSignedUrl("putObject", s3Params);

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadURL: uploadURL,
    }),
  };
};
*/

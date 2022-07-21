// 🖋️ Presigned Upload URL Generator
// This function generates a presigned URL for uploading to S3, and checks
// the current bucket to make sure we are not uploading a duplicate file, by
// autogenerating a uuid with nanoid.

// 🔏 Security
// Please ensure the bucket used to upload media has a CORS policy that
// matches the hosting domain.

// It should be... *.aesthetic.computer with
// allowed methods GET, PUT and HEAD.

// TODO
// - [] Upload the file using this presigned url, via the client.
//  - Read: https://stackoverflow.com/a/28699269/8146077
// - [] Show the media file experation date to the user.
// - [] Visiting aesthetic.computer/art~code will show the
//      file in a viewer.
// - [x] Get presigned S3 URL from S3 bucket

// Next version?
// - [] Use a multi-part uploader.

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 8);

const s3 = new S3Client({
  endpoint: "https://" + process.env.ART_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ART_KEY,
    secretAccessKey: process.env.ART_SECRET,
  },
});

export async function handler(event, context) {
  const extension = event.path.slice(1).split("/")[1];
  let mimeType;

  if (extension === "png") {
    mimeType = "image/png";
  }

  if (extension === "mp4") {
    mimeType = "video/mp4";
  }

  if (!mimeType) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid file extension.",
      }),
    };
  }

  let loadCode = nanoid();
  let fileName = loadCode + ".png";

  // Check to see if this code has already been uploaded to blockStorage and if it has,
  // generate a new code. (This should almost never repeat.) See also: https://zelark.github.io/nano-id-cc
  while ((await fileExists(fileName)) === true) {
    loadCode = nanoid();
    fileName = loadCode + "." + extension;
  }

  const putObjectParams = {
    Bucket: process.env.ART_SPACE_NAME,
    Key: fileName,
    ContentType: mimeType,
    ACL: "public-read",
    // Metadata: {
    //   foo: 'bar',
    //   lol: 'hi'
    // }
  };

  const command = new PutObjectCommand(putObjectParams);
  const uploadURL = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadURL: uploadURL,
    }),
  };
}

async function fileExists(filename) {
  try {
    const params = {
      Bucket: process.env.ART_SPACE_NAME,
      Key: filename,
    };

    const headCode = await s3.headObject(params).promise();
    console.error("File already exists:", filename);
    return true;
  } catch (headErr) {
    if (headErr.code === "NotFound") {
      // console.log("File doesn't exist yet:", filename);
      return false;
    }
  }
}

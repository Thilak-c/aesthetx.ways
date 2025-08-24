import crypto from "crypto";

export async function POST(req) {
  try {
    const { txnid, amount, productinfo, firstname, email } = await req.json();

    const key =  "xIvVCn";  // test key: gtKFFx
    const salt = "S3uFP1dJ6GpIq5w5zgpWXz9a8lt6zIdo";            // test salt: 

    if (!key || !salt) {
      return Response.json({ error: "Missing PayU key or salt" }, { status: 500 });
    }

    // udf1–udf5 empty
    const udf1 = "";
    const udf2 = "";
    const udf3 = "";
    const udf4 = "";
    const udf5 = "";

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return Response.json({ hash, key });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

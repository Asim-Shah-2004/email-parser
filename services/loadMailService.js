import "dotenv/config";
import Imap from "imap";
import { simpleParser } from "mailparser";

const imapConfig = {
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: 993,
  tls: true,
};

const extractSignatureBlock = (body) => {
  if (!body) return [];

  const lines = body.trim().split("\n").map((line) => line.trim());
  const signatureKeywords = ["thanks", "regards", "sincerely", "best", "kind regards"];
  let signatureStartIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    if (signatureKeywords.some((keyword) => lines[i].toLowerCase().includes(keyword))) {
      signatureStartIndex = i;
      break;
    }
  }

  if (signatureStartIndex === -1) return [];

  const start = Math.max(0, signatureStartIndex - 10);
  const end = Math.min(lines.length, signatureStartIndex + 11);

  return lines.slice(start, end);
};

const loadMailService = (no_of_emails) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);
    const signatureResults = [];

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(["ALL"], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          const latestEmails = results.slice(-no_of_emails);
          if (latestEmails.length === 0) {
            imap.end();
            resolve([]);
            return;
          }

          const f = imap.fetch(latestEmails, { bodies: "" });
          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              simpleParser(stream, (err, parsed) => {
                if (err) {
                  console.error("Parse error:", err);
                  return;
                }

                const fromAddress = parsed.from.value[0].address;
                if (fromAddress === "applicant@dice.com") return;

                const signatureArray = extractSignatureBlock(parsed.text);
                signatureArray.unshift(`From: ${fromAddress}`);
                signatureResults.push(signatureArray.join("\n"));
              });
            });
          });

          f.once("error", (ex) => {
            reject(ex);
          });

          f.once("end", () => {
            imap.end();
            resolve(signatureResults);
          });
        });
      });
    });

    imap.once("error", (err) => {
      reject(err);
    });

    imap.connect();
  });
};

export default loadMailService;

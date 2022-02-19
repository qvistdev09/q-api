import FS from "fs";

export const loadEnv = () => {
  const envData = FS.readFileSync("./.env", "utf-8");
  envData.split("\n").forEach((envDataLine) => {
    const [key, value] = envDataLine.split("=");
    if (key && value) {
      process.env[key] = value;
    }
  });
};

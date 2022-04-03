import FS from "fs";

export const loadEnv = (dotEnvPath: string) => {
  const envData = FS.readFileSync(dotEnvPath, "utf-8");
  envData.split("\n").forEach((envDataLine) => {
    const [key, value] = envDataLine.split("=");
    if (key && value) {
      process.env[key] = value;
    }
  });
};

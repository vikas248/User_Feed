import fs from 'fs';
import path from 'path';

const logDirectory = './logs';

function logMiddleware(req, res, next) {
  const { method, originalUrl, user } = req;
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${user?.name || 'Anonymous'} - ${method} ${originalUrl}\n`;

  // Ensure the log directory exists
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const logFilePath = path.join(logDirectory, 'api_logs.txt');

  // Append the log entry to the log file
  fs.appendFileSync(logFilePath, logEntry, 'utf8');

  next();
}

export default logMiddleware;

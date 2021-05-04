import * as chalk from "chalk";
const chalkErrorLog = (msg: string, err: any) => {
  console.log(chalk.yellow(msg), chalk.red(err));
};

export default chalkErrorLog;

import {exec} from "node:child_process";
import util from "node:util";

const execPromise = util.promisify(exec);

// exec("ruby sample.rb", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });

  function shell_exec(cmd)
 { 
    console.log("started");
    return new Promise((resolve, reject)=> {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
             reject(error);
             return;
         }
         resolve(stdout)
        }); });
    }
async function my_fun(){
 await shell_exec("ruby sample.rb");
 console.log("done");
}
    
my_fun();



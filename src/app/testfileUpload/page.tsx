import { uploadFile } from "@/actions/filehandler";
import { log } from "console";

const submitAction = async (formdata: FormData) => {
    "use server";

    console.log(formdata);

    const response = await uploadFile(formdata);
    console.log({ response });
};

// const getFilesAction = async (filedata: FormData) => {
//     "use server";
//     const response = await getFiles(filedata);
//     console.log({ response });
// };

export default async function Page() {
    return (
        <div>
            <h1>File Upload Test</h1>
            <form action={submitAction}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form>

            {/* <h1>Get all files</h1>
            <button
                onClick={() => getFilesAction(new FormData())}
                type="button">
                Get Files
            </button> */}
        </div>
    );
}

import { handleFileUpload, getFile } from "@/actions/filehandler";

export default async function Page() {
    const files = await getFile();

    console.log({ files });

    return (
        <div>
            <h1>File Upload Test</h1>
            <form action={handleFileUpload}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form>

            {files?.map((file, index) => (
                <audio key={index} src={file}></audio>
            ))}

            {/* <audio controls src={file}></audio> */}
        </div>
    );
}

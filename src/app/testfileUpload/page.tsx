import { handleFileUpload, getFile } from "@/actions/filehandler";

export default async function Page() {
    const files = await getFile();

    return (
        <div>
            <h1>File Upload Test</h1>
            <form action={handleFileUpload}>
                <input type="file" name="file" />
                <button type="submit">Upload</button>
            </form>
            {/* {files && <audio controls src={files[0]}></audio>} */}
            <ul>
                {files.map((file, index) => (
                    <li key={index}>
                        <audio controls key={index} src={file}></audio>
                    </li>
                ))}
            </ul>

            {/* <audio controls src={file}></audio> */}
        </div>
    );
}

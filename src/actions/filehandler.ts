"use server";
import {
    PutObjectCommand,
    PutObjectCommandInput,
    GetObjectCommand,
    GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3Client"; // Din klient ovan
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { paginateListObjectsV2 } from "@aws-sdk/client-s3";

export async function handleFileUpload(formData: FormData) {
    const file = formData.get("file") as File;

    // Konvertera filen till en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const params: PutObjectCommandInput = {
        Bucket: process.env.S3_BUCKET_NAME, // namn på din bucket
        Key: file.name.toLowerCase(), // filnamnet i S3
        Body: buffer, // filens innehåll
        ContentType: file.type, // filens MIME-typ
    };

    await s3Client.send(new PutObjectCommand(params));
}


export async function getFile() {
    const objects: string[] = [];
    const paginator = paginateListObjectsV2(
        { client: s3Client, /* Max items per page */ pageSize: 10 },
        { Bucket: process.env.S3_BUCKET_NAME },
    );
    
    for await (const page of paginator) {
        for(const obj of page.Contents ?? []) {
            // Säkerställ att Key finns
            
            if (!obj.Key) {
                return;
            }
            const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: obj.Key }), { expiresIn: 3600 });
            console.log({url, objKey: obj.Key});

            objects.push(url);
            
        };
        
    }

    return objects; // Returnerar en platt array av URL:er
}












        
    //   objects.push(page.Contents?.map(async (obj) => {
    //     // Säkerställ att Key finns
    //     if (!obj.Key) {
    //         return;
    //     } 
        
    //     const url = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME!, Key: obj.Key }), { expiresIn: 3600 });
    //     return url;
    //   }));
    // }
    // objects.forEach((object, pageNum) => {
    //   console.log(
    //     `Page ${pageNum + 1}\n------\n${object?.map((o) => `• ${o}`).join("\n") || "No objects found"}\n`,
    //   );
    // });

    // const url = await getSignedUrl(s3Client, objects, { expiresIn: 3600 });




// export async function getFile(fileName: string) {
//     const params: GetObjectCommandInput = {
//         Bucket: process.env.S3_BUCKET_NAME, // namn på din bucket
//         Key: fileName, // filnamnet i S3
//     };

//     const command = new GetObjectCommand(params);

//     const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

//     return url;
// }

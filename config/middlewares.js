module.exports = [
    {
        name: "strapi::body",
        config: {
            formLimit: "256mb", // modify form body
            jsonLimit: "256mb", // modify JSON body
            textLimit: "256mb", // modify text body
            formidable: {
                maxFileSize: 200 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
            },
        },
    }
];
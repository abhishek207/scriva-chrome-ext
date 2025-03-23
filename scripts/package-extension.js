const fs = require("fs")
const path = require("path")
const archiver = require("archiver")

// Paths
const extensionDistPath = path.join(__dirname, "../extension/dist")
const publicPath = path.join(__dirname, "../public")
const zipPath = path.join(publicPath, "speakwrite-extension.zip")

// Ensure public directory exists
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true })
}

// Create a file to stream archive data to
const output = fs.createWriteStream(zipPath)
const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level
})

// Listen for all archive data to be written
output.on("close", () => {
  console.log(`Extension packaged successfully: ${archive.pointer()} total bytes`)
  console.log(`Zip file created at: ${zipPath}`)
})

// Handle warnings and errors
archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(err)
  } else {
    throw err
  }
})

archive.on("error", (err) => {
  throw err
})

// Pipe archive data to the file
archive.pipe(output)

// Append files from the dist directory
archive.directory(extensionDistPath, false)

// Finalize the archive
archive.finalize()


import XLSX from "xlsx";

// Helper func
export async function readFileToBuffer(inputFile: File): Promise<Uint8Array> {
    return new Promise((rec) => {
        let reader = new FileReader();

        reader.onload = function () {
            const arrayBuffer = new Uint8Array(reader.result as ArrayBuffer);
            rec(arrayBuffer);
        };

        reader.readAsArrayBuffer(inputFile);
    });
}

// https://docs.sheetjs.com/docs/api/utilities/array#array-output
export async function readXlsxFileToJsonScheme(inputFile: File) {
    try {
        const arrayBuffer = await readFileToBuffer(inputFile);

        // Convert the Excel buffer to a workbook
        const workbook = XLSX.read(arrayBuffer, {
            type: "array",
            cellDates: true,
            dateNF: 'yyyy-mm-ddTHH:MM:ssZ',
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert the sheet data to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            blankrows: false,
            defval: null,
            raw: true
            // raw: false
        });

        // Map the array to an array of objects
        const resultArray = jsonData.map((row: any) => {
            const obj = {} as any;
            for (let i = 0; i < jsonData[0].length; i++) {
                obj[jsonData[0][i]] = row[i];
            }
            return obj;
        });

        const noHeaderLs = resultArray.slice(1);

        console.log("noHeaderLs", noHeaderLs);

        return noHeaderLs;
    } catch (error) {
        console.log(error);
        return []
    }
}

/** Helper to make xlsx sheet */
function excelFileMaking(
    data: any[],
    type: "xlsx" | "csv" = "xlsx",
    failCells?: string[]
): Blob {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    if (!!failCells && failCells?.length > 0) {
        for (let cell of failCells) {
            worksheet[cell].s = { fill: { fgColor: { rgb: "FF0000" } } }
        }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, { bookType: type, type: 'array' });
    return new Blob([excelBuffer], { type: 'application/octet-stream' });
}

/** Trigger the download by accepting str of `URL.createObjectURL(blob)` */
function toDownloadFile(
    fileStr: string,
    fileName: string,
    ext: string
) {

    if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = fileStr;

        // File name
        link.download = `${fileName}${ext}`;
        link.click();
    }

}

/** Create and download xlsx sheet without zip */
export function excelExportSingleFile(
    data: any[],
    fileName: string, ext: "xlsx" | "csv" = "xlsx",
    failCells?: string[]
): void {
    const blob = excelFileMaking(data, ext, failCells)
    toDownloadFile(URL.createObjectURL(blob), fileName, "." + ext)
}
import React, { useMemo, useState } from "react";

import { z } from "zod"
import { IconArrowLeft, IconDownload, IconInfoCircle, IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

import { Dropzone, DropzoneProps, FileRejection } from '@mantine/dropzone';

import { Box, Table, Divider, Text, Card, Grid, Alert, Group, Tooltip, ScrollArea, rem, Modal, ActionIcon, Button } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { excelExportSingleFile, readXlsxFileToJsonScheme } from "../utils/xlsxUtils";

/** For additional informations explains */
export interface InfoColumnsInput {
    /** Must be match with your Zod Scheme Key (e.g. User ID ) */
    key: string

    /** 
     * Remind User what data should be included in the xlsx (Not Functional, just for display only)
     * @default "string"
     * */
    type: "string" | "number" | "date" | "blank" | (string & {})

    /** Explain more about the cols header (e.g. Record user id )
     *  @default undefined
     */
    description?: string

    /** Data examples explains (e.g. Yes | No )
     * @default undefined
     */
    examples?: string
}

interface InfoColumns extends InfoColumnsInput {
    /** 
     * Is this header / col is a optional header? (e.g. true ) 
     * @default false
     * */
    optional?: boolean

    /** 
     * Is this data allow to be null? (e.g. true ) 
     * @default true
     * */
    requireInput?: boolean
}

/** Import Xlsx Check Props */
export type MantineImportTableProps<T extends z.ZodObject<z.ZodRawShape>,> = {
    /** Your z.object() scheme */
    zodScheme: T

    /** Info Array For additional informations 
     * @default []
    */
    info?: InfoColumnsInput[]

    /** Will return your z.object() Array after a success input */
    successCb: (data: z.output<T>[]) => void;

    /** Return Reject input files */
    onReject?: (fileRejections: FileRejection[]) => void

    /**  Max xlsx / csv file size in bytes 
     * @default 10 * 1024 ** 2
    */
    maxFileSize?: number

    /** Display download generated header xlsx template button?
     * @default true
    */
    showDownloadTemplate?: boolean
}

export const MantineImportTable = <T extends z.ZodObject<z.ZodRawShape>,>({
    zodScheme,
    successCb,
    onReject,
    maxFileSize = 10 * 1024 ** 2,
    showDownloadTemplate = true,
    info = [],
    ...props
}: MantineImportTableProps<T> & Partial<DropzoneProps>) => {

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [opened, { open, close }] = useDisclosure(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [warningRows, setWarningRows] = useState<number[]>([]);
    const [warningLines, setWarningLines] = useState<{
        row: number
        key: string
        msg: string
        code: string
    }[]>([]);
    const [warningData, setWarningData] = useState<Record<string, any>[]>([]);

    const explainCols: InfoColumns[] = useMemo(() => {
        return [...zodScheme.keyof().options].map((key: string) => {
            const foundInfo = info.find(info => info.key === key);
            const schemaForKey = zodScheme.shape[key];

            if (foundInfo === undefined) {
                return {
                    key: key,
                    type: "string",
                    optional: schemaForKey.isOptional(),
                    requireInput: schemaForKey.isNullable(),
                }
            }

            return {
                ...foundInfo,
                optional: schemaForKey.isOptional(),
                requireInput: schemaForKey.isNullable(),
            }
        })
    }, [zodScheme, info]);

    function closeModal() {
        close();
        setErrorMsg(null)
        setWarningRows([])
        setWarningLines([])
        setWarningData([])
    }

    return (
        <>
            <Modal
                centered
                size={"75%"}
                opened={opened}
                onClose={closeModal}
                title="Invalid Input"
            >
                <Box>
                    <Text size="sm" c="dimmed">
                        Please check the following items in your XLSX / CSV file.
                    </Text>

                    <Divider my="md" />

                    {errorMsg && (
                        <Text size="sm">
                            {errorMsg}
                        </Text>
                    )}

                    {warningData.length >= 1 && (
                        <Box>
                            <Box>
                                <Text size="sm" mb={8}>
                                    Please check the following items in your XLSX / CSV file.
                                </Text>

                                <Card shadow="sm" padding="lg" radius="md" withBorder>
                                    <Text mb={4} fw={500} fz={18}>
                                        Error Types
                                    </Text>

                                    <Text c="dimmed" fz={12}>
                                        Total {warningLines.length} error{warningLines.length >= 2 ? "s" : ""}
                                    </Text>

                                    <ScrollArea h={250}>
                                        <Table striped>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Lines</Table.Th>
                                                    <Table.Th>Columns</Table.Th>
                                                    <Table.Th>Error Code</Table.Th>
                                                    <Table.Th>Message</Table.Th>
                                                    <Table.Th>Notices</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>

                                            <Table.Tbody>
                                                {warningLines.map((v, i) => (
                                                    <Table.Tr key={i}>
                                                        <Table.Td>{+v.row}</Table.Td>
                                                        <Table.Td>{v.key}</Table.Td>
                                                        <Table.Td>{v.code}</Table.Td>
                                                        <Table.Td>{v.msg}</Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </ScrollArea>
                                </Card>

                                <Divider my="md" />

                                <Card shadow="sm" padding="lg" radius="md" withBorder>
                                    <Text mb={4} fw={500} fz={18}>
                                        Error Data
                                    </Text>

                                    <Text c="dimmed" fz={12}>
                                        Total {warningRows.length} error row{warningRows.length >= 2 ? "s" : ""}
                                    </Text>

                                    <ScrollArea h={250}>
                                        <Table striped>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>
                                                        Row
                                                    </Table.Th>
                                                    {Object.keys(warningData[0]).map(v => (
                                                        <Table.Th key={v}>
                                                            {v}
                                                        </Table.Th>
                                                    ))}
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {warningRows.map(rowNum => ({ row: rowNum , ...warningData.find( v => v["__rowNum__"] === rowNum) })).map((val, i) => (
                                                    <Table.Tr key={i}>
                                                        {Object.keys(val).map(key => (
                                                            <Tooltip label={
                                                                warningLines.find(w => w.key === key && val.row === w.row )
                                                                    ? warningLines.find(w => w.key === key && val.row === w.row )!.msg
                                                                    : val[key as keyof typeof val] + ""
                                                            }>
                                                                <Table.Th
                                                                    key={key}
                                                                    bg={
                                                                        warningLines.find(w => w.key === key && val.row === w.row )
                                                                            ? "#ff6363"
                                                                            : ''
                                                                    }
                                                                >
                                                                    {val[key as keyof typeof val] + ""}
                                                                </Table.Th>
                                                            </Tooltip>
                                                        ))}
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </ScrollArea>
                                </Card>
                            </Box>
                        </Box>
                    )}

                    <Group justify="flex-end" mt={12}>
                        <Button
                            onClick={closeModal}
                            variant="default"
                            leftSection={<IconArrowLeft size={16} />}
                        >
                            Back
                        </Button>
                    </Group>
                </Box>
            </Modal>

            <Card shadow="sm" padding="lg" radius="md" withBorder>

                <Grid>
                    <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>

                        <Group justify="space-between">
                            <Text fw={500} fz={18}>
                                Upload XLSX / CSV file
                            </Text>

                            {showDownloadTemplate && (
                                <Tooltip label="Download Template">
                                    <ActionIcon
                                        variant="light"
                                        aria-label="Download Template"
                                        onClick={() => {
                                            const objKeys = [...zodScheme.keyof().options].reduce((acc, v) => ({ ...acc, [v]: "" }), {});

                                            excelExportSingleFile(
                                                [objKeys],
                                                "Template",
                                                "xlsx"
                                            )
                                        }}>
                                        <IconDownload style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>

                        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />} mt={12}>
                            Make sure your file includes all the required columns.
                        </Alert>

                        <Text fw={500} fz={18} mt={12}>
                            Required columns
                        </Text>
                        <Text c="dimmed" fz={12}>
                            Make sure these header are in your file
                        </Text>

                        <Divider my="sm" />

                        {explainCols.filter(v => !v.optional).map(v => (
                            <Group key={v.key} justify="space-between">
                                <Box>
                                    <Text>
                                        {v.key} {!v.requireInput && (
                                            <Tooltip label={"Not Allow Blank Input"}>
                                                <Text span c={"red"}>*</Text>
                                            </Tooltip>
                                        )}
                                    </Text>
                                    {v.description && (
                                        <Text c="dimmed" fz={12}>
                                            {v.description}
                                        </Text>
                                    )}
                                </Box>

                                <Group>
                                    <Text c="dimmed" fz={12}>
                                        {v.type}{" "}{v.requireInput && "/ blank"}
                                    </Text>

                                    <Tooltip label={`e.g. ${v.examples || "N/A"}`}>
                                        <IconInfoCircle size={16} />
                                    </Tooltip>
                                </Group>
                            </Group>
                        ))}

                        {explainCols.filter(v => v.optional).length >= 1 && (
                            <Box>
                                <Text fw={500} fz={18} mt={36}>
                                    Optional columns
                                </Text>
                                <Text c="dimmed" fz={12}>
                                    These Header are optional
                                </Text>

                                <Divider my="sm" />

                                {explainCols.filter(v => v.optional).map(v => (
                                    <Group key={v.key} justify="space-between">
                                        <Box>
                                            <Text>
                                                {v.key} {!v.requireInput && (
                                                    <Tooltip label={"Not Allow Blank Input"}>
                                                        <Text span c={"red"}>*</Text>
                                                    </Tooltip>
                                                )}
                                            </Text>
                                            {v.description && (
                                                <Text c="dimmed" fz={12}>
                                                    {v.description}
                                                </Text>
                                            )}
                                        </Box>

                                        <Group>
                                            <Text c="dimmed" fz={12}>
                                                {v.type}{" "}{v.requireInput && "/ blank"}
                                            </Text>

                                            <Tooltip label={`e.g. ${v.examples || "N/A"}`}>
                                                <IconInfoCircle size={16} />
                                            </Tooltip>
                                        </Group>
                                    </Group>
                                ))}
                            </Box>
                        )}

                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                        <Dropzone
                            loading={isLoading}
                            onDrop={async (files) => {

                                let data: any[] = [];

                                try {
                                    setIsLoading(true);
                                    data = await readXlsxFileToJsonScheme(files[0]);

                                    // Check Headers Missing Items
                                    const keys = explainCols.filter(v => !v.optional).map(v => v.key) as string[];
                                    const toRemove: Set<string> = new Set(Object.keys(data[0]));
                                    const difference = keys.filter(x => !toRemove.has(x));

                                    if (difference.length >= 1) {
                                        throw new Error(
                                            `Missing Header ${difference.map(v => `'${v}'`).join(", ")} at your file.`
                                            + `Please check the spelling or missing data.`
                                        )
                                    }

                                    // Parse With Zod
                                    const zodSchemeLs = z.array(zodScheme);
                                    const parseData: z.infer<typeof zodScheme>[] = zodSchemeLs.parse(data);

                                    successCb(parseData);
                                }
                                catch (error: any) {
                                    if (error instanceof z.ZodError) {

                                        console.log(error.issues);

                                        const setWarnLines = error.issues.map(v => ({
                                            row: data[+v.path[0]]["__rowNum__"],
                                            key: v.path[1] + "",
                                            code: v.code + "",
                                            msg: v.message
                                        }))

                                        setWarningLines(
                                            setWarnLines
                                        )

                                        setWarningRows(Array.from(new Set(setWarnLines.map( v => v.row ))))
                                        setWarningData(data)
                                        open();
                                    }
                                    else {
                                        setErrorMsg(error.message);
                                        open();
                                    }
                                }
                                finally {
                                    setIsLoading(false)
                                }
                            }}
                            onReject={onReject}
                            maxSize={maxFileSize}
                            maxFiles={1}
                            accept={[
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "application/vnd.ms-excel",
                                "text/csv"
                            ]}
                            {...props}
                        >
                            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "inherit" }}>
                                <Dropzone.Accept>
                                    <IconUpload
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconPhoto
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5}
                                    />
                                </Dropzone.Idle>

                                <div>
                                    <Text size="xl" inline>
                                        Drag file here or click to select file
                                    </Text>
                                    <Text size="sm" c="dimmed" inline mt={7}>
                                        Accept xlsx / csv file (Max {(maxFileSize / 1024 / 1024).toFixed(1)} MB)
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>

                    </Grid.Col>
                </Grid>
            </Card>
        </>
    )
}



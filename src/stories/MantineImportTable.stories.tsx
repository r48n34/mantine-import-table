import React from 'react';

import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';

import { MantineProvider } from '@mantine/core';

import type { Meta, StoryObj } from '@storybook/react';
import { MantineImportTable } from '../components/MantineImportTable';
import { z } from 'zod';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'Example/MantineImportTable',
    component: MantineImportTable,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <MantineProvider>
                < Story />
            </MantineProvider>
        ),
    ],
    argTypes: {
        zodScheme: {
            disable: true
        },
        successCb: {
            disable: true
        },
        info: {
            disable: true
        },
        onReject: {
            disable: true
        },
    },
} satisfies Meta<typeof MantineImportTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {

    args: {
        showDownloadTemplate: true,
        zodScheme: z.object({
            "University Number": z.string().min(1),
            "Curriculum Code": z.number(),
            "Curriculum": z.string().nullable(),
            "Fish Enum": z.enum(["Salmon", "Tuna", "Trout"]),
            "Date": z.date(),
            "idk": z.string().optional()
        }),
        successCb: (v) => console.log(v)
    },
};
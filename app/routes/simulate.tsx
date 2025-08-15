import { json, type ActionFunctionArgs } from "@remix-run/node"
import { withZod } from '@remix-validated-form/with-zod'
import { simulate } from "helpers/simulate"
import type { ReturnConfiguration } from "helpers/random-returns"
import { z } from 'zod'
import { zfd } from 'zod-form-data'

const schema = z.object({
    year: zfd.numeric(z.number().min(2000)),
    end: zfd.numeric(z.number().min(2000)),
    sparplanElements: z.string().transform((val) => JSON.parse(val)).pipe(
        zfd.repeatableOfType(
            z.object({
                start: z.string().transform((val) => new Date(val)),
                einzahlung: zfd.numeric(z.number().min(0)),
                type: z.literal('sparplan'),
                simulation: z.object({}).transform(() => ({})),
            }).or(z.object({
                start: z.string().transform((val) => new Date(val)),
                einzahlung: zfd.numeric(z.number().min(0)),
                gewinn: zfd.numeric(z.number().min(0)),
                type: z.literal('einmalzahlung'),
                simulation: z.object({}).transform(() => ({})),
            }))
        )
    ),
    // Legacy field for backward compatibility
    rendite: zfd.numeric(z.number().min(0)).optional(),
    // New return configuration fields
    returnMode: z.enum(['fixed', 'random', 'variable']).optional().default('fixed'),
    fixedRate: zfd.numeric(z.number().min(0)).optional(),
    averageReturn: zfd.numeric(z.number().min(0)).optional(),
    standardDeviation: zfd.numeric(z.number().min(0)).optional(),
    randomSeed: zfd.numeric(z.number().int()).optional(),
    // Variable returns data (JSON string containing year-to-rate mapping)
    variableReturns: z.string().optional(),
    
    steuerlast: zfd.numeric(z.number().min(0)),
    teilfreistellungsquote: zfd.numeric(z.number().min(0)),
    freibetragPerYear: z.string().transform((val) => JSON.parse(val)).pipe(
        z.record(z.string(), z.number().min(0).max(10000))
    ).optional(),
    simulationAnnual: z.enum(['yearly', 'monthly'])
})

export async function action({request}: ActionFunctionArgs) {
    const body = await request.formData()
    const { data: formData, error } = await withZod(schema).validate(body)
    if (error) {
        console.error(error)
        return json({ error: 'Validation failed' }, { status: 400 });
    }
    if (!formData) {
        return json({ error: 'No data provided' }, { status: 400 });
    }

    const { 
        year, 
        end, 
        sparplanElements, 
        rendite, 
        returnMode, 
        fixedRate, 
        averageReturn, 
        standardDeviation, 
        randomSeed,
        variableReturns,
        steuerlast, 
        teilfreistellungsquote,
        freibetragPerYear,
        simulationAnnual 
    } = formData

    // Build return configuration
    let returnConfig: ReturnConfiguration | number;
    
    if (rendite !== undefined) {
        // Legacy API: use the old rendite parameter
        returnConfig = rendite;
    } else {
        // New API: build return configuration
        if (returnMode === 'random') {
            returnConfig = {
                mode: 'random',
                randomConfig: {
                    averageReturn: averageReturn || 0.07, // Default 7%
                    standardDeviation: standardDeviation || 0.15, // Default 15%
                    seed: randomSeed
                }
            };
        } else if (returnMode === 'variable') {
            let yearlyReturns: Record<number, number> = {};
            try {
                if (variableReturns) {
                    yearlyReturns = JSON.parse(variableReturns);
                }
            } catch (e) {
                console.error('Failed to parse variable returns:', e);
            }
            returnConfig = {
                mode: 'variable',
                variableConfig: {
                    yearlyReturns
                }
            };
        } else {
            returnConfig = {
                mode: 'fixed',
                fixedRate: fixedRate || 0.05 // Default 5%
            };
        }
    }

    const simulation = simulate(
        year,
        end,
        sparplanElements,
        returnConfig,
        steuerlast,
        simulationAnnual,
        teilfreistellungsquote,
        freibetragPerYear
    )
    console.log(sparplanElements[0].simulation)
    console.log(simulation[0].simulation?.[2040])

    return json({
        sparplanElements: simulation
    })
}



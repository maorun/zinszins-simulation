import { json, type ActionFunctionArgs } from "@remix-run/node"
import { withZod } from '@remix-validated-form/with-zod'
import { simulate } from "helpers/simulate"
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
    rendite: zfd.numeric(z.number().min(0)),
    steuerlast: zfd.numeric(z.number().min(0)),
    simulationAnnual: z.enum(['yearly', 'monthly'])
})

export async function action({request}: ActionFunctionArgs) {
    const body = await request.formData()
    const { data: formData, error } = await withZod(schema).validate(body)
    if (error) {
        console.error(error)
    }
    if (!formData) {
        return null
    }

    const { year, end, sparplanElements, rendite, steuerlast, simulationAnnual } = formData

    const simulation = simulate(
        year,
        end,
        sparplanElements,
        rendite,
        steuerlast,
        simulationAnnual
    )
    console.log(sparplanElements[0].simulation)
    console.log(simulation[0].simulation?.[2040])

    return json({
        sparplanElements: simulation
    })
}



import { z } from "zod";

import { addQuoteSchema } from "./schema";

export type AddQuoteFormValues = z.infer<typeof addQuoteSchema>;

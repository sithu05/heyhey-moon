import { z } from "zod";

import { editPromptSchema } from "./schema";

export type EditPromptFormValues = z.infer<typeof editPromptSchema>;

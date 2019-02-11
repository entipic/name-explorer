import { SimpleEntity } from "wiki-entity";

export interface WebEntity extends SimpleEntity {
    name: string
    simpleName?: string
    englishName?: string
    popularity: number
    names?: string[]
}

export type SimpleUniqueName = {
	id: string
	name: string
	lang: string
	country?: string
}

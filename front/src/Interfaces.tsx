export interface ISubject {
    id: number,
    name: string,
    topics: ITopic[]
}

export interface ITopic {
    id: number,
    name: string,
    notes: INote[]
}

export interface INote {
    id: number,
    text: string
}
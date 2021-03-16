export interface IUser {
    /** Username */
    name: string;
}

export interface ISubject {
    /** Database ID */
    id: number,
    /** Name of the subject */
    name: string,
    /** Array of topics under the subject */
    topics?: ITopic[]
    /** Order of topics as stringified JSON */
    topicOrder: string;
}

export interface ITopic {
    /** Database ID */
    id: number,
    /** Name of the Topic */
    name: string,
    /** Array of notes under the topic */
    notes: INote[]
    /** Order of notes as stringified JSON */
    noteOrder: string;
}

export interface INote {
    /** Database ID */
    id: number,
    /** Note itself */
    text: string
}
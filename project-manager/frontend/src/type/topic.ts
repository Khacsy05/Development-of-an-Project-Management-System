export interface Topic {
    topic_id: string;
    title: string;
    description: string | null;
    technologies: string;
    expertise_id: string;
    expertise?: {
        name: string;
    } | null;
    creator?: {
        fullname: string;
    } | null;
}
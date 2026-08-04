export interface Topic {
    topic_id: string;
    title: string;
    description: string | null;
    technologies: string;
    expertise_id: string;
    is_available: boolean;
    expertise?: {
        name: string;
    } | null;
    creator?: {
        fullname: string;
        role?: {
            role_name: string;
        } | null;
    } | null;
}

export interface TopicParams {
    isAvailable?: string;
    title?: string;
    facultyId?: string;
    page?: number;
    limit?: number;
}

export interface CreateTopicDto {
    title: string;
    description: string;
    technologies: string;
    expertise_id: string;

}

export interface UpdateTopicDto extends CreateTopicDto {
    is_available: boolean;
}
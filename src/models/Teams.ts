
export interface TeamMember{
    id: number,
    name: string
}

export interface Team {
    name: string,
    members: TeamMember[]
}
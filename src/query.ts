export const query: string = `
query TournamentEvents($groupId: ID!, $page: Int!, $perPage: Int!) {
  phaseGroup(id: $groupId) {
    bracketType
    sets(sortType: ROUND, page: $page, perPage: $perPage) {
      pageInfo {
        page
        totalPages
      }
      nodes {
        id
        fullRoundText
        slots {
          entrant {
            name
          }
          standing {
            stats {
              score {
                value
              }
            }
          }
        }
      }
    }
  }
}`;

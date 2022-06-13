export const query: string = `
query TournamentEvents($groupId: ID) {
  phaseGroup(id: $groupId) {
    bracketType
    sets(perPage: 100) {
      nodes {
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

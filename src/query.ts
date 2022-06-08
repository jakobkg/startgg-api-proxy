export const query = `
  query TournamentEvents($phaseId: ID) {
    phase(id: $phaseId) {
      name
      sets {
        nodes {
          fullRoundText
          round
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

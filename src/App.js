import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Spinner, Accordion } from "react-bootstrap";
import leagues from "./data/leagues";

const API_KEY = "3"; // Replace with your actual API key

function App() {
  const [leagueResults, setLeagueResults] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper to fetch team badge/logo
  const fetchTeamBadge = async (teamName) => {
    try {
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${teamName}`
      );
      const data = await res.json();
      return data.teams?.[0]?.strTeamBadge || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchAllResults = async () => {
      const results = {};

      for (const league of leagues) {
        try {
          const res = await fetch(
            `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventspastleague.php?id=${league.id}`
          );
          const data = await res.json();
          const events = data.events?.slice(0, 10) || [];

          // Enrich events with team badges
          const enrichedEvents = await Promise.all(
            events.map(async (event) => ({
              ...event,
              homeBadge: await fetchTeamBadge(event.strHomeTeam),
              awayBadge: await fetchTeamBadge(event.strAwayTeam),
            }))
          );

          results[league.name] = enrichedEvents;
        } catch (err) {
          console.error(`Error fetching ${league.name}`, err);
          results[league.name] = [];
        }
      }

      setLeagueResults(results);
      setLoading(false);
    };

    fetchAllResults();
  }, []);

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Soccer Results – Major Leagues</h1>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          {Object.entries(leagueResults).map(([leagueName, events], idx) => (
            <Accordion.Item eventKey={idx.toString()} key={leagueName}>
              <Accordion.Header>{leagueName}</Accordion.Header>
              <Accordion.Body>
                <Row>
                  {events.map((event) => (
                    <Col md={6} lg={4} key={event.idEvent} className="mb-4">
                      <Card>
                        <Card.Body>
                          <Card.Title>{event.strEvent}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">
                            {event.dateEvent}
                          </Card.Subtitle>
                          <Card.Text className="d-flex align-items-center justify-content-between">
                            <span className="d-flex align-items-center">
                              {event.homeBadge && (
                                <img
                                  src={event.homeBadge}
                                  alt=""
                                  height="20"
                                  className="me-2"
                                />
                              )}
                              {event.strHomeTeam}
                            </span>
                            <strong>
                              {event.intHomeScore} - {event.intAwayScore}
                            </strong>
                            <span className="d-flex align-items-center">
                              {event.strAwayTeam}
                              {event.awayBadge && (
                                <img
                                  src={event.awayBadge}
                                  alt=""
                                  height="20"
                                  className="ms-2"
                                />
                              )}
                            </span>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
}

export default App;

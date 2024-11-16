import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { ReactComponent as DisplayIcon } from './assets/Display.svg'; // Adjust the path to your SVG file

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grouping, setGrouping] = useState('status');
  const [sortBy, setSortBy] = useState('priority');
  const [users, setUsers] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  // Fetch tickets and users data
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const ticketResponse = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const ticketData = await ticketResponse.json();

        const usersData = [
          { id: "usr-1", name: "Anoop Sharma", available: false },
          { id: "usr-2", name: "Yogesh", available: true },
          { id: "usr-3", name: "Shankar Kumar", available: true },
          { id: "usr-4", name: "Ramesh", available: true },
          { id: "usr-5", name: "Suresh", available: true }
        ];

        setTickets(ticketData.tickets);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Memoize user mapping to prevent unnecessary re-renders
  const userMapping = useMemo(() => {
    const mapping = {};
    users.forEach(user => {
      mapping[user.id] = user.name;
    });
    return mapping;
  }, [users]);

  // Group tickets based on selected option (status, user, or priority)
  const groupedTickets = () => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      console.log("No tickets available.");
      return {};
    }

    let grouped = {};

    tickets.forEach((ticket) => {
      const key =
        grouping === 'status'
          ? ticket.status
          : grouping === 'user'
          ? userMapping[ticket.userId] || ticket.userId
          : ticket.priority;

      if (key) {
        grouped[key] = grouped[key] ? [...grouped[key], ticket] : [ticket];
      }
    });

    // Sorting tickets by priority or title
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        if (sortBy === 'priority') {
          return b.priority - a.priority;
        } else if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    });

    return grouped;
  };

  // If data is loading or an error occurs, show loading or error message
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;

  const groupedData = groupedTickets();

  return (
    <div className="kanban-board">
      {/* Display Button */}
      <div className="controls">
        <button className="display-btn" onClick={() => setShowOptions(!showOptions)}>
          <DisplayIcon className="icon" /> Display
        </button>

        {/* Dropdown for Grouping and Sorting options */}
        {showOptions && (
          <div className="dropdown">
            <label>
              Group By:
              <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </label>
            <label>
              Sort By:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-columns">
        {Object.keys(groupedData).length === 0 ? (
          <div>No tickets to display</div>
        ) : (
          Object.keys(groupedData).map((group) => (
            <div className="kanban-column" key={group}>
              <h3>{group}</h3>
              {groupedData[group].map((ticket) => (
                <div className="kanban-card" key={ticket.id}>
                  <div className="card-header">
                    <h4>{ticket.title}</h4>
                    <span className={`priority priority-${ticket.priority}`}>
                      Priority:{ticket.priority}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Status:</strong> {ticket.status}</p>
                    <p><strong>User:</strong> {userMapping[ticket.userId] || 'Unknown'}</p>
                  </div>
                  <div className="card-footer">
                    <button className="action-button">More Info</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

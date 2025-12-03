import React, { useState } from "react";
import TableView from "./components/TableView";

function App() {
  const [tableName, setTableName] = useState("depository_account_operation_type");

  const tables = [
    "depository_account_operation_type",
    "brokerage_account_operation_type",
    "proposal_type",
    "verification_status",
    "position",
    "security",
    "currency",
    "bank",
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Данные из базы</h1>
      <select
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      >
        {tables.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <TableView tableName={tableName} />
    </div>
  );
}

export default App;

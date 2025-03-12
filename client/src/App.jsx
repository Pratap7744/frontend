import React, { useState } from "react";
import DocumentManager from "./components/DocumentManager";
import QuotationManager from "./components/QuotationManager";

function App() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
    <h1>Document & Quotation Manager</h1>
    <DocumentManager />
</div>
    );
}

export default App;

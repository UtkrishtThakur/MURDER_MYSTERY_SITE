export default function DisqualifiedPage() {
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050000", color: "#ff3333", fontFamily: "monospace", textAlign: "center" }}>
            <div>
                <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>SYSTEM LOCKOUT</h1>
                <p>Your team has been disqualified from further investigation.</p>
                <p style={{ marginTop: "2rem", opacity: 0.5 }}>ERROR CODE: DISQ_1</p>
            </div>
        </div>
    );
}

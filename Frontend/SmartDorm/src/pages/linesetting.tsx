import { useState } from "react";
import axios from "axios";

export default function LineConfigPage() {
  const [messagingId, setMessagingId] = useState("");
  const [messagingSecret, setMessagingSecret] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginSecret, setLoginSecret] = useState("");

  const handleSave = async () => {
    await axios.post("/api/line/config", {
      messagingId,
      messagingSecret,
      loginId,
      loginSecret,
    });
    alert("บันทึกข้อมูลเรียบร้อยแล้ว");
  };

  return (
    <div className="p-5">
      <h2>ตั้งค่า LINE API</h2>
      <div className="mt-3">
        <label>Messaging API - Channel ID</label>
        <input value={messagingId} onChange={(e) => setMessagingId(e.target.value)} className="input" />
      </div>
      <div className="mt-3">
        <label>Messaging API - Channel Secret</label>
        <input value={messagingSecret} onChange={(e) => setMessagingSecret(e.target.value)} className="input" />
      </div>
      <div className="mt-3">
        <label>LINE Login - Channel ID</label>
        <input value={loginId} onChange={(e) => setLoginId(e.target.value)} className="input" />
      </div>
      <div className="mt-3">
        <label>LINE Login - Channel Secret</label>
        <input value={loginSecret} onChange={(e) => setLoginSecret(e.target.value)} className="input" />
      </div>

      <button onClick={handleSave} className="btn btn-primary mt-4">บันทึก</button>
    </div>
  );
}

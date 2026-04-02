import {
  Box,
  Typography,
  Container,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedReply, setGeneratedReply] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/email/generate",
        {
          emailContent,
          tone,
        },
      );
      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data),
      );
    } catch (e) {
      console.error("Error generating reply:", e);
      setGeneratedReply("Error generating reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Email Reply Generator
        </Typography>

        <Box sx={{ mx: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            label="Original Email Content"
            placeholder="Paste the email you received..."
            value={emailContent || ""}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tone (Optional)</InputLabel>
            <Select
              value={tone || ""}
              label="Tone (Optional)"
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Professional">Professional</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Friendly">Friendly</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            sx={{ mb: 2 }}
            onClick={handleSubmit}
            disabled={!emailContent || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Generate Reply"}
          </Button>
        </Box>
        <Box sx={{ mx: 3 }}>
          <Box
  sx={{
    border: "1px solid #ccc",
    borderRadius: 2,
    p: 2,
    mb: 2,
    minHeight: "150px",
    backgroundColor: "#f9f9f9",
    fontSize: "14px",
    lineHeight: 1.6,
  }}
>
  {generatedReply ? (
    <ReactMarkdown>{generatedReply}</ReactMarkdown>
  ) : (
    <Typography color="text.secondary">
      Your AI generated reply will appear here...
    </Typography>
  )}
</Box>
          <Button
            variant="outlined"
            onClick={() => navigator.clipboard.writeText(generatedReply)}
            disabled={!generatedReply}
          >
            Copy to Clipboard
          </Button>
        </Box>
      </Container>
    </>
  );
}

export default App;

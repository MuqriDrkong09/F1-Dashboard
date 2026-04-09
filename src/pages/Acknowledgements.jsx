import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Acknowledgements() {
  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Acknowledgements & recognition
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Credits, data sources, and trademark notices for this project.
        </Typography>

        <Stack spacing={3}>
          <section aria-labelledby="ack-openf1-heading">
            <Typography id="ack-openf1-heading" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              OpenF1 API
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Championship standings, meetings, sessions, drivers, and results are loaded from the
              public{" "}
              <Link
                href="https://openf1.org"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                OpenF1
              </Link>{" "}
              API (
              <Link
                href="https://api.openf1.org/"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                api.openf1.org
              </Link>
              ). OpenF1 is an independent open-data project; this app is not endorsed by OpenF1.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data is provided as-is. Availability, accuracy, and rate limits are determined by the
              API operator, not this dashboard.
            </Typography>
          </section>

          <Divider />

          <section aria-labelledby="ack-f1-heading">
            <Typography id="ack-f1-heading" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Formula 1® and trademarks
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is an <strong>unofficial</strong> personal / educational project. It is not
              affiliated with, sponsored by, or endorsed by Formula 1 companies.{" "}
              <strong>Formula 1</strong>, <strong>F1</strong>, <strong>GRAND PRIX</strong>, and
              related marks are trademarks of{" "}
              <Link
                href="https://www.formula1.com/"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                Formula One Licensing B.V.
              </Link>{" "}
              or its affiliates. All rights reserved by their respective owners. Team and driver
              names are used for factual identification of publicly available data only.
            </Typography>
          </section>

          <Divider />

          <section aria-labelledby="ack-stack-heading">
            <Typography id="ack-stack-heading" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Built with
            </Typography>
            <Typography variant="body2" color="text.secondary">
              React, Vite, React Router, Material UI (MUI), Recharts, and other open-source
              libraries as listed in the project&apos;s <code>package.json</code>.
            </Typography>
          </section>
        </Stack>
      </Container>
    </Box>
  );
}

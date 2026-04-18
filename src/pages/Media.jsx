import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Instagram from "@mui/icons-material/Instagram";
import MovieOutlined from "@mui/icons-material/MovieOutlined";
import OndemandVideo from "@mui/icons-material/OndemandVideo";
import OpenInNew from "@mui/icons-material/OpenInNew";
import YouTube from "@mui/icons-material/YouTube";
import X from "@mui/icons-material/X";

const mediaLinks = [
  {
    title: "F1 video hub",
    description: "Highlights, features, and official clips on Formula1.com.",
    href: "https://www.formula1.com/en/video.html",
    label: "Open F1 video hub",
    icon: MovieOutlined,
  },
  {
    title: "YouTube — @Formula1",
    description: "Race highlights, press conferences, and channel exclusives.",
    href: "https://www.youtube.com/@Formula1",
    label: "Open Formula 1 on YouTube",
    icon: YouTube,
  },
  {
    title: "F1 TV",
    description: "Live sessions and on-demand replays (subscription).",
    href: "https://www.f1tv.formula1.com/",
    label: "Open F1 TV",
    icon: OndemandVideo,
  },
  {
    title: "Instagram — @f1",
    description: "Photos, reels, and paddock moments from the championship.",
    href: "https://www.instagram.com/f1/",
    label: "Open F1 on Instagram",
    icon: Instagram,
  },
  {
    title: "X — @F1",
    description: "News, schedules, and live weekend updates from the series.",
    href: "https://x.com/F1",
    label: "Open F1 on X",
    icon: X,
  },
];

export default function Media() {
  return (
    <Box component="main" sx={{ py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "primary.main", letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}
          >
            Media
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, letterSpacing: -0.02 }}>
            Watch and follow Formula 1
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1.5, maxWidth: 640, lineHeight: 1.65 }}
          >
            Quick links to official video, streaming, and social channels. This dashboard is not affiliated
            with Formula 1; all destinations open in a new tab.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {mediaLinks.map(({ title, description, href, label, icon: Icon }) => (
            <Grid key={href} size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark" ? theme.shadows[12] : theme.shadows[6],
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.45),
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": {
                      transform: "none",
                      boxShadow: 1,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: 100,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "action.hover",
                    backgroundImage: (theme) =>
                      `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(
                        theme.palette.primary.dark,
                        0.06,
                      )} 42%, ${alpha(theme.palette.common.black, 0.04)} 100%)`,
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 44,
                      color: "primary.main",
                      opacity: 0.95,
                      filter: (theme) =>
                        theme.palette.mode === "dark" ? "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" : "none",
                    }}
                    aria-hidden
                  />
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    pt: 2.25,
                    px: 2.25,
                    pb: 1,
                    "&:last-child": { pb: 1 },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{ fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.01 }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, lineHeight: 1.55, flex: 1 }}
                  >
                    {description}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    px: 2.25,
                    pb: 2.25,
                    pt: 0,
                    mt: "auto",
                    gap: 1,
                  }}
                >
                  <Button
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="outlined"
                    color="primary"
                    fullWidth
                    endIcon={<OpenInNew sx={{ fontSize: 18 }} />}
                    aria-label={label}
                    sx={{
                      justifyContent: "center",
                      fontWeight: 600,
                      borderRadius: 1.5,
                      py: 0.75,
                    }}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

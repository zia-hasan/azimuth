import React from "react";
import { Box, Breakpoint, Container } from "@mui/material";
import PageHeader from "components/PageHeader";

type Props = {
  maxWidth?: Breakpoint;
  children: React.ReactNode;
};

const BasicLayout: React.FC<Props> = ({ maxWidth = "xl", children }) => (
  <>
    <PageHeader />
    <Box height="100%" display="flex" flexDirection="column" overflow="scroll">
      <Container maxWidth={maxWidth} sx={{ flex: 1, padding: 2 }}>
        {children}
      </Container>
    </Box>
  </>
);

export default React.memo(BasicLayout);

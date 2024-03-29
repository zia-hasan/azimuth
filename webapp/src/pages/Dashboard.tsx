import { Box, Button, Typography } from "@mui/material";
import noData from "assets/void.svg";
import PerturbationTestingPreview from "components/Analysis/PerturbationTestingPreview";
import PreviewCard from "components/Analysis/PreviewCard";
import WarningsPreview from "components/Analysis/WarningsPreview";
import Telescope from "components/Icons/Telescope";
import Loading from "components/Loading";
import PerformanceAnalysis from "components/Metrics/PerformanceAnalysis";
import ThresholdPlot from "components/ThresholdPlot";
import useQueryState from "hooks/useQueryState";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { getDatasetInfoEndpoint } from "services/api";
import { isPipelineSelected } from "utils/helpers";

const DEFAULT_PREVIEW_CONTENT_HEIGHT = 502;

const Dashboard = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { pipeline, searchString } = useQueryState();

  const { data, error, isFetching } = getDatasetInfoEndpoint.useQuery({
    jobId,
  });

  if (isFetching) {
    <Loading />;
  } else if (error) {
    return (
      <Box alignItems="center" display="grid" justifyItems="center">
        <img src={noData} width="50%" alt="no dataset info" />
        <Typography>{error.message}</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX={4}
        paddingY={1}
      >
        <Typography variant="h2">Dashboard</Typography>
        <Button
          color="secondary"
          variant="contained"
          component={Link}
          to={`/${jobId}/dataset_splits/eval/performance_overview${searchString}`}
          sx={{ gap: 1 }}
        >
          <Telescope fontSize="large" />
          Go to exploration space
        </Button>
      </Box>
      {data?.availableDatasetSplits.train && (
        <PreviewCard
          title="Dataset Class Distribution Analysis"
          to={`/${jobId}/dataset_class_distribution_analysis${searchString}`}
        >
          <Box height={DEFAULT_PREVIEW_CONTENT_HEIGHT}>
            <WarningsPreview jobId={jobId} />
          </Box>
        </PreviewCard>
      )}
      {isPipelineSelected(pipeline) && (
        <PreviewCard title="Performance Analysis">
          <PerformanceAnalysis jobId={jobId} pipeline={pipeline} />
        </PreviewCard>
      )}
      {isPipelineSelected(pipeline) && data?.perturbationTestingAvailable && (
        <PreviewCard
          title="Behavioral Testing"
          to={`/${jobId}/behavioral_testing_summary${searchString}`}
        >
          <Box height={DEFAULT_PREVIEW_CONTENT_HEIGHT}>
            <PerturbationTestingPreview
              jobId={jobId}
              pipeline={pipeline}
              availableDatasetSplits={data.availableDatasetSplits}
            />
          </Box>
        </PreviewCard>
      )}
      {isPipelineSelected(pipeline) &&
        data?.postprocessingEditable?.[pipeline.pipelineIndex] && (
          <PreviewCard
            title="Post-processing Analysis"
            to={`/${jobId}/thresholds${searchString}`}
          >
            <Box height={DEFAULT_PREVIEW_CONTENT_HEIGHT}>
              <ThresholdPlot jobId={jobId} pipeline={pipeline} />
            </Box>
          </PreviewCard>
        )}
    </Box>
  );
};

export default React.memo(Dashboard);

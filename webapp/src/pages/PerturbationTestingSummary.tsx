import { Box, Typography } from "@mui/material";
import PerturbationTestingSummaryTable from "components/PerturbationTestingSummary/PerturbationTestingSummaryTable";
import useQueryState from "hooks/useQueryState";
import React from "react";
import { useParams } from "react-router-dom";
import { getDatasetInfoEndpoint } from "services/api";
import { PIPELINE_REQUIRED_TIP } from "utils/const";
import { isPipelineSelected } from "utils/helpers";

const PerturbationTestingSummary = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { pipeline } = useQueryState();

  const { data: datasetInfo, isFetching: isFetchingDatasetInfo } =
    getDatasetInfoEndpoint.useQuery({ jobId });

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Typography variant="h4" paddingBottom={2}>
        Behavioral Testing Summary
      </Typography>
      {isPipelineSelected(pipeline) ? (
        <PerturbationTestingSummaryTable
          jobId={jobId}
          pipeline={pipeline}
          availableDatasetSplits={datasetInfo?.availableDatasetSplits}
          isLoading={isFetchingDatasetInfo}
        />
      ) : (
        <Typography>{PIPELINE_REQUIRED_TIP}</Typography>
      )}
    </Box>
  );
};

export default React.memo(PerturbationTestingSummary);

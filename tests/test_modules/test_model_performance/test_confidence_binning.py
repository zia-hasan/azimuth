# Copyright ServiceNow, Inc. 2021 – 2022
# This source code is licensed under the Apache 2.0 license found in the LICENSE file
# in the root directory of this source tree.

import numpy as np

from azimuth.modules.model_performance.confidence_binning import (
    CONFIDENCE_BINS_COUNT,
    ConfidenceBinIndexModule,
    ConfidenceHistogramModule,
)
from azimuth.types import DatasetColumn, DatasetFilters, DatasetSplitName, ModuleOptions

UNKNOWN_TARGET = [3]
BIN_GAP = 0.06


def test_confidence_histogram(simple_text_config, apply_mocked_startup_task):
    mod = ConfidenceHistogramModule(
        DatasetSplitName.eval,
        simple_text_config,
        mod_options=ModuleOptions(filters=DatasetFilters(labels=[0]), pipeline_index=0),
    )
    out = mod.compute_on_dataset_split()[0].details_all_bins
    ds = mod.get_dataset_split()

    assert len(out) == CONFIDENCE_BINS_COUNT  # We have CONFIDENCE_BINS_COUNT bins.
    # We should have the right number of samples.
    assert sum(count for v in out for count in v.outcome_count.values()) == len(ds)
    # The mean confidence should be close to the bin confidence.
    assert all(
        np.allclose(v.bin_confidence, v.mean_bin_confidence, atol=BIN_GAP)
        for v in out
        if sum(v.outcome_count.values()) > 0
    )


def test_confidence_histogram_empty(simple_text_config, apply_mocked_startup_task):
    mod = ConfidenceHistogramModule(
        DatasetSplitName.eval,
        simple_text_config,
        mod_options=ModuleOptions(filters=DatasetFilters(labels=UNKNOWN_TARGET), pipeline_index=0),
    )
    out = mod.compute_on_dataset_split()[0].details_all_bins

    assert len(out) == CONFIDENCE_BINS_COUNT  # We have CONFIDENCE_BINS_COUNT bins.
    # When filters cause an empty dataset_split, we should return empty bins
    assert sum(count for v in out for count in v.outcome_count.values()) == 0


def test_confidence_bin_idx(simple_text_config, apply_mocked_startup_task):
    mod = ConfidenceBinIndexModule(
        DatasetSplitName.eval,
        simple_text_config,
        mod_options=ModuleOptions(pipeline_index=0, indices=list(range(10))),
    )
    out = mod.compute_on_dataset_split()
    ds = mod.get_dataset_split()

    assert len(out) == len(ds)  # We have bin_idx for all utterances

    # Bin index matches confidence
    for bin_id, confidences in zip(out, ds[DatasetColumn.postprocessed_confidences]):
        bin_index = np.floor(np.max(confidences) * CONFIDENCE_BINS_COUNT)
        assert bin_index == bin_id

# Copyright ServiceNow, Inc. 2021 – 2022
# This source code is licensed under the Apache 2.0 license found in the LICENSE file
# in the root directory of this source tree.
import numpy as np
from fastapi import FastAPI
from starlette.status import HTTP_200_OK
from starlette.testclient import TestClient


def test_get_confusion_matrix(app: FastAPI) -> None:
    client = TestClient(app)

    resp = client.get("/dataset_splits/eval/confusion_matrix?pipelineIndex=0")
    assert resp.status_code == HTTP_200_OK, resp.text
    data = resp.json()
    assert np.allclose(
        data["confusionMatrix"],
        [[0.090, 0.136, 0.772], [0.05, 0.05, 0.9], [0.0, 0.0, 0.0]],
        atol=1e-2,
    )

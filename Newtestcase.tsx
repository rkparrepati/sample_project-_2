test("handles duplicate records and updates state with alert message", async () => {
  const setdupcountriesMock = jest.fn();
  const setalertMessageMock = jest.fn();
  const setOpenCancelDialogMock = jest.fn();
  const setbyPassAddDupRecordMock = jest.fn();
  const handleTabClickMock = jest.fn();

  const contextValue = {
    selectedRow: [{ id: "prod-1", productName: "Test Product" }],
    setdupcountries: setdupcountriesMock,
    setalertMessage: setalertMessageMock,
    setOpenCancelDialog: setOpenCancelDialogMock,
    setbyPassAddDupRecord: setbyPassAddDupRecordMock,
    handleTabClick: handleTabClickMock,
  };

  const mockFormMethods = {
    trigger: jest.fn(() => true), // Simulate form validation success
    getValues: jest.fn(() => ({
      productName: { label: "Test Product", value: "Test Product" },
      procedureType: { label: "Jordan Procedure", value: "Jordan Procedure" },
      country: [{ label: "Country1", value: "country1" }],
    })),
  };

  jest.spyOn(service, "get").mockResolvedValue({
    data: {
      data: {
        content: [
          {
            applicationdata: JSON.stringify({
              productName: "Test Product",
              producerType: "Jordan Procedure",
              country: "country1",
            }),
          },
        ],
      },
    },
  });

  (useForm as jest.Mock).mockReturnValue(mockFormMethods);

  await act(async () => {
    render(
      <RowContext.Provider value={contextValue}>
        <AddApplicationsGrid />
      </RowContext.Provider>
    );
  });

  // Simulate clicking the "next" button to trigger validation
  fireEvent.click(screen.getByText("next"));

  await waitFor(() => {
    // Ensure duplicate records are detected and state is updated
    expect(setOpenCancelDialogMock).toHaveBeenCalledWith(true);
    expect(setbyPassAddDupRecordMock).toHaveBeenCalledWith(true);
    expect(setdupcountriesMock).toHaveBeenCalledWith(["Country1"]);
    expect(setalertMessageMock).toHaveBeenCalledWith(
      "Below countries have already Application with selected product and procedure."
    );
    expect(handleTabClickMock).not.toHaveBeenCalled(); // Ensure tab click is not triggered
  });
});

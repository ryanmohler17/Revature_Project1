package com.ryan.service;

import com.ryan.models.Request;
import com.ryan.models.RequestPart;
import com.ryan.models.RequestType;

import java.util.List;

public class RequestService {

    public double getTotalAmount(Request request) {
        List<RequestPart> partList = request.getParts();
        double total = 0;
        for (RequestPart requestPart : partList) {
            if (requestPart.getType().equals(RequestType.TRAVEL_MILES)) {
                total += (requestPart.getRate() * requestPart.getAmount());
            } else {
                total += requestPart.getAmount();
            }
        }
        return total;
    }

}

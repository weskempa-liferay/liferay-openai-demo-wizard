import { Axios } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

import { axiosInstance } from "../../services/liferay";
import functions from "../../utils/functions";
import { logger } from "../../utils/logger";

const debug = logger("OrganizationsAction");

export default async function OrganizationsAction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const start = new Date().getTime();

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const axios = axiosInstance(req, res);

  const organizationsSchema = {
    properties: {
      organizations: {
        description: "An array of business organization company names",
        items: {
          properties: {
            childbusinesses: {
              description:
                "An array of " +
                req.body.childOrganizationtNumber +
                " businesses within the organization",
              items: {
                properties: {
                  departments: {
                    description:
                      "An array of " +
                      req.body.departmentNumber +
                      " departments within the business",
                    items: {
                      properties: {
                        name: {
                          description: "Name of the department",
                          type: "string",
                        },
                      },
                      type: "object",
                    },
                    required: ["name", "departments"],
                    type: "array",
                  },
                  name: {
                    description: "A creative name of the business",
                    type: "string",
                  },
                },
                type: "object",
              },
              required: ["name"],
              type: "array",
            },
            name: {
              description: "A creative name of the business organization.",
              type: "string",
            },
          },
          required: ["name", "childbusinesses"],
          type: "object",
        },
        required: ["organizations"],
        type: "array",
      },
    },
    type: "object",
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: "get_organizations", parameters: organizationsSchema }],
    messages: [
      {
        content:
          "You are an organization manager responsible for listing the business organizations for your company.",
        role: "system",
      },
      {
        content:
          "Create a list of expected organizations, child businesses, and departments for a company that provides " +
          req.body.organizationTopic +
          ". " +
          "Do not include double quotes in the response.",
        role: "user",
      },
    ],
    model: req.body.config.model,
    temperature: 0.6,
  });

  const organizations = JSON.parse(
    response.choices[0].message.function_call.arguments,
  ).organizations;

  for (const organization of organizations) {
    const childbusinesses = organization.childbusinesses;
    const organizationId = await createOrganization(axios, organization, 0);

    debug(
      organizationId + " has " + childbusinesses.length + " child businesses.",
    );

    for (const childOrganization of childbusinesses) {
      const childOrganizationId = await createOrganization(
        axios,
        childOrganization,
        organizationId,
      );

      let departments = childOrganization.departments;

      debug(
        childOrganizationId +
          " has " +
          departments.length +
          " related departments.",
      );

      for (const department of departments) {
        await createOrganization(axios, department, childOrganizationId);
      }
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result: "Completed in " + functions.millisToMinutesAndSeconds(end - start),
  });
}

async function createOrganization(axios: Axios, organization, parentOrgId) {
  try {
    const response = await axios.post(
      "/o/headless-admin-user/v1.0/organizations",
      {
        name: organization.name,
        ...(parentOrgId > 0 && {
          parentOrganization: {
            id: parentOrgId,
          },
        }),
      },
    );

    return response.data.id;
  } catch (error) {
    console.log(error);
  }

  return 0;
}

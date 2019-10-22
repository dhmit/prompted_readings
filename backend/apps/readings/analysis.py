"""

Analysis.py - analyses for dhmit/rereading wired into the webapp

"""

import statistics
from .models import StudentResponse


class RereadingAnalysis:
    """
    This class loads all student responses from the db,
    and implements analysis methods on these responses.

    We use .serializers.AnalysisSerializer to send these analysis results to the
    frontend for display.
    """

    def __init__(self):
        """ On initialization, we load all of the StudentResponses from the db """
        self.responses = StudentResponse.objects.all()

    def total_view_time(self):
        """
        Queries the db for all StudentResponses,
        and computes total time (across all users) spent reading the text

        :return: float, the total time all users spent reading the text
        """
        total_view_time = 0
        for response in self.responses:
            for view_time in response.get_parsed_views():
                total_view_time += view_time
        return total_view_time

    def compute_median_view_time(self):
        """
         Given a list of student response dicts,
        return the median time (across all users) spent reading the text
        :return: float, median amount of time users spend reading the text
        """
        list_of_times = []
        for row in self.responses:
            for view_time in row.get_parsed_views():
                list_of_times.append(view_time)
        if not list_of_times:
            median_view_time = 0
        else:
            list_of_times.sort()
            median_view_time = statistics.median(list_of_times)
        return median_view_time

    # def unique_responses(self):
    #     contexts = list(self.responses.context.distinct())
    #     unique_response_dict = {}
    #     # separate the unique responses by context
    #     for item in contexts:
    #         context_responses = list(self.responses.response.distinct().filter(
    #                                  context__icontains=item))
    #         unique_response_dict[item] = context_responses
    #     # find the intersection between all contexts
    #     common_responses = []
    #     for value in unique_response_dict.values():
    #         for element in value:
    #             if element not in common_responses:
    #                 common_responses.append(element)
    #     # find the difference between all contexts
    #     for value in unique_response_dict.values():
    #         it_list = value[:]
    #         for element in it_list:
    #             if element in common_responses:
    #                 value.delete(element)
    #     return unique_response_dict

from rest_framework.decorators import api_view
from rest_framework.response import Response
from analysis.apps import AnalysisConfig


def extractAreaFromQuery(query):
    """Function to extract area from query"""
    words = query.split()
    return words[-1].lower() if words else None


def generateSummary(area, data):
    # Generating average price and demand in the area using the filtered data.
    avgPrice = round(data['flat_-_weighted_average_rate'].mean(), 2) 
    avgDemand = round(data["residential_sold_-_igr"].mean(), 2) if "residential_sold_-_igr" in data else None
    return (
        f"{area} has an average Price of {avgPrice} and average Demand of {avgDemand}."
    )


# Views
@api_view(['POST'])
def analyze_area(request):
    try:
        query = request.data.get('query', "")
        # Query Error Handling
        if not query:
            return Response({"Error": "Query Missing !!"}, status=400)

        query = query.lower()
        area = extractAreaFromQuery(query)
        if not area:
            return Response({"Error": "Area missing in Query!!"}, status=400)


        df = AnalysisConfig.excel_data
        if df is None:
            return Response({"Error": "Excel Not Loaded"}, status=500)
        
        df = df.copy()
        # Normalize columns: lowercase, remove leading/trailing spaces, replace spaces with underscores
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
        print("Normalized columns:", df.columns.tolist())
        # Filtering Rows
        filtered = df[df['final_location'].str.lower() == area]
        if filtered.empty:
            return Response({"Error": "Area Not Found"}, status=404)

        # Json Response
        chart_data = {
            "years": filtered['year'].tolist(),
            "prices": filtered['flat_-_weighted_average_rate'].tolist(),
            "demand": filtered['residential_sold_-_igr'].tolist(),
        }

        # Generating Summary
        summary = generateSummary(area, filtered)

        # Conversion to dictionary
        table = filtered.to_dict(orient='records')

        return Response({
            "area": area,
            "chart_data": chart_data,
            "summary": summary,
            "table": table
        })

    except Exception as e:
        return Response({"Error": str(e)}, status=500)



        



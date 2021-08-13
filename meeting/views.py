
from django.contrib.auth.decorators import login_required
from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, render

from meeting.forms import MeetingForm
from meeting.models import Meeting


def index(request):
    try:
        meeting = get_object_or_404(Meeting, id=request.GET.get("room"))
        print(meeting.password, request.GET.get("password"))
        if meeting.password != request.GET.get("password"):
            return JsonResponse({"error": "권한이 없습니다."}, status=400)
        return render(request, 'meeting/index.html', {"meeting": meeting})
    except:
        return JsonResponse({"error":"존재하지 않는 회의입니다."},status=404)


@login_required
def create_meeting(request):
    if request.method == "POST":
        form = MeetingForm(data=request.POST)
        if form.is_valid():
            meeting = form.save()
            return JsonResponse({
                "id": meeting.id,
                "name": meeting.name,
            }, status=201)
    return JsonResponse({
        "error": "잘못된 접근입니다.",
    }, status=400)

def roulette(request):
    return render(request,'roulette/roulette.html')